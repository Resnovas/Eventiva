/**
 * Project: @eventiva/pdf
 * File: pdf.ts
 * Path: \src\pdf.ts
 * Created Date: Monday, March 21st 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Wed Mar 23 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * 
 * This program has been provided under confidence of the copyright holder and is 
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 * 
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see http://www.gnu.org/licenses/gpl-3.0-standalone.html
 * 
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import {PDFDocument} from 'pdf-lib'
import axios from 'axios';
import { SIACheck } from '@eventiva/internals';
import { Bucket } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

// get a PDf document by url
export async function getPDF(Url: string) {
    // fetch a pdf from url
    const fetched = await axios.get(Url, { responseType: 'arraybuffer' })
    // create pdf document from pdf
    const doc = await PDFDocument.load(fetched.data)
    // return the doc
    return doc
}

export interface FormFields {
    venue: {
        logo: string
        name: string
        dateCommenced: string
    },
    officer: {
        name: string
        dob: string
        address: string
        profilePicture?: string
    },
    badge: {
        photo: string
        number: string
        expiryDate?: string
    }
}

export async function generateForm(doc: PDFDocument, formFields: FormFields, bucket: Bucket) {
    const form = doc.getForm()
    
    // Apply Brand Logo
    const logoBytes = (await axios.get(formFields.venue.logo, { responseType: 'arraybuffer' })).data
    const brandLogo = formFields.venue.logo.endsWith(".jpg") ? await doc.embedJpg(logoBytes) : await doc.embedPng(logoBytes)
    const BrandLogoField = form.getButton('Brand Logo')
    BrandLogoField.setImage(brandLogo)
    
    // Set the Venue Name
    form.getTextField('Venue Name').setText(formFields.venue.name)
    form.getTextField('DateCommenced').setText(formFields.venue.dateCommenced)
    // set profile information
    form.getTextField('Officer Name').setText(formFields.officer.name)
    form.getTextField('DateOfBirth').setText(formFields.officer.dob)
    form.getTextField('Address').setText(formFields.officer.address)
    // set badge information
    form.getTextField('Badge No').setText(formFields.badge.number)
    form.getTextField('Expiry Date').setText(formFields.badge.expiryDate)
    // set profile picture
    if (formFields.officer.profilePicture) {
        const profilePictureBytes = (await axios.get(formFields.officer.profilePicture, { responseType: 'arraybuffer' })).data
        const profilePicture = formFields.officer.profilePicture.endsWith(".jpg") ? await doc.embedJpg(profilePictureBytes) : await doc.embedPng(profilePictureBytes)
        const ProfilePictureField = form.getButton('Profile Picture')
        ProfilePictureField.setImage(profilePicture, )
    }
    // set badge picture
    if (formFields.badge.photo) {
        const badgePictureBytes = (await axios.get(formFields.badge.photo, { responseType: 'arraybuffer' })).data
        const badgePicture = formFields.badge.photo.endsWith(".jpg") ? await doc.embedJpg(badgePictureBytes) : await doc.embedPng(badgePictureBytes)
        const BadgePictureField = form.getButton('Badge Picture')
        BadgePictureField.setImage(badgePicture)
    }
    // set badge check
    if (formFields.badge.number) {
        const check = await badgeCheck(formFields)
        if (check.status !== "ACTIVE" || !check.pubUrl) throw new Error("Badge is inactive")
        const badgeCheckBytes = (await axios.get(check.pubUrl, { responseType: 'arraybuffer' })).data as ArrayBuffer
        const badgeCheckpng = await doc.embedPng(badgeCheckBytes)
        badgeCheckpng.scaleToFit(500, 130)
        form.getButton('Badge Check').setImage(badgeCheckpng)
        form.getTextField('Expiry Date').setText(check.badge?.expiry?.toString())
    }
    
    const pdfBytes = await doc.save()
    fs.writeFileSync(path.join(process.cwd() + '/temp/form.pdf'), pdfBytes)
    // const completed = await bucket.file('profile/' + formFields.badge.number + '.pdf')
    // completed.save(pdfBytes.toString(), {
    //     contentType: 'application/pdf',
    // })
    // completed.makePublic()
    // return completed.publicUrl()
}

/**
 * The license number issued by the SIA.
 * @pattern 10[0-9]\{14\}
 * @format License
 * @example 1030123456789012
 */
export type License = number;

async function badgeCheck(formFields: FormFields): Promise<SIACheck> {
    return await (await axios.get('https://europe-west1-eventiva.cloudfunctions.net/siacheck/sia/check/' + formFields.badge.number)).data as SIACheck
}