/**
 * Project: @eventiva/projectname
 * File: filename
 * Path: path/to/filename
 * Created Date: full length date (e.g. Monday, March 21st 2022)
 * Author: your name
 * -----
 * Last Modified: date last modified (e.g. Mon Mar 21 2022)
 * Modified By: your name
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


import { Controller, Body, Route, Post} from 'tsoa';
import { createBucket } from './Google/createBucket';
import { FormFields, generateForm, getPDF } from './pdf';
/**
 * @author <your name>
 * @since 1.0.0
 * @version 1.0.0
 * @public
 */
@Route('profile')
export class ProfilePDF extends Controller {
  
    @Post('file/create')
    public async function(
        @Body() body: { template: string, form: FormFields }
    ) {
        const bucket = await createBucket()
        const template = await getPDF(body.template)
        return await generateForm(template, body.form, bucket)
    }
}

