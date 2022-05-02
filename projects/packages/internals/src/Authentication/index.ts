/**
 * Project: @eventiva/internals
 * File: index.ts
 * Path: \src\Authentication\index.ts
 * Created Date: Tuesday, March 29th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Thu Apr 07 2022
 * Modified By: Jonathan Stevens
 * Current Version: 0.0.5
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

import { PrismaClient } from "@prisma/client"
import { Database } from "../database"
import { Account, Token, TokenType } from "../database/generated"
import crypto from 'crypto'

export interface Salted extends Salt { hash: string}
export interface Salt { salt: string, expiry: Date }

export class Authentication {
    private d: Database
    private db: PrismaClient
    
    constructor(d: Database) {
        this.d = d
        this.db = this.d.db
    }

    /**
     * Creates a hashed object for accounts and tokens. 
     * This should be used only by internal systems and can result in inconsistent user accessability if used incorrectly.
     * @internal
     * @since 0.0.5
     * @author Jonathan Stevens
     * @param password - The password to be hashed and returned in hex format
     * @param option - The account or token which this password is linked
     */
    public async createHashed(password: string, option: { salt?: Salt, account?:Account, token?: Token } | null = null): Promise<string | Salted> {
        let account: Account | undefined
        let opt: Account | Token | undefined = undefined
        if (option == null) {

            // Used to create a new account's temporary password

            // get a random number of rounds to use
            let rounds = Math.random() * 10
            // create an expiry date for the password which is 3 days from now
            let expiry = new Date()
            expiry.setDate(expiry.getDate() + 3)
            // create a salt from the expiry and the random number and a sequence of characters
            let salt = (expiry.getMilliseconds() / expiry.getDay()) + crypto.randomBytes(Math.ceil(rounds / 2)).toString('hex').slice(0, rounds) + InternalSalt + UserSalt 
            // mix up the salt string
            salt = salt.split('').sort().join('')
            // hash the password
            return {
                hash: crypto.createHmac('sha256', salt).update(password).digest('hex'),
                salt: salt,
                expiry: expiry
            }

        } else if (option.salt) {
            // confirm a hashed password
            return crypto.createHmac('sha256', option.salt.salt).update(password).digest('hex')

        } else if (option.account) {

            account = option.account
            opt = option.account
        } else if (option.token) {
            const a = await this.db.account.findUnique({ where: { id: option.token.accountID } })
            if (!a || a == null) throw new Error('Account not found to connect this token')
            account = a
            opt = option.token
        }
        if (!account || !opt) throw new Error('Passed option has no account data, cannot create hash')

        // If the option is not null, we are setting a password for an account or token so use the account information to hash the string.

        // create a salt string from the account information
        let salt = (opt.createdAt.getMilliseconds() / opt.createdAt.getDay()) + opt.id + account.username + account.accountType
        // mix up the salt string
        salt = salt.split('').sort().join('')
        // hash the password
        return crypto.createHmac('sha256', salt).update(password).digest('hex')
    }

    /**
     * Creates a token then stores it on the users account.
     * @internal
     * @since 0.0.5
     * @author Jonathan Stevens
     * @param accountID - The account id of the user creating the token
     * @param type - The token type to be created
     */
    async createToken(nickname: string, accountID: Account["id"], type: TokenType) {
        // create expiry for 2 years time
        let expiry = new Date()
        expiry.setFullYear(expiry.getFullYear() + 2)
        // create a token from the expiry and type
        const rounds = Math.random() * 50
        // create the token string
        const value = await this.createHashed(crypto.randomBytes(Math.ceil(rounds / 2)).toString('hex').slice(0, rounds))
        // create the token class
        const token = await this.db.token.create({
            data: {
                type,
                expiry,
                account: { connect: { id: accountID } },
                value: "rn_" + accountID + "evt_" + (typeof (value) === 'string' ? value : value.hash),
                nickname
            }
        })
        if (!token || !token.value) throw new Error('Failed to create token')
        // create a hashed version of the token
        const hashed = await this.createHashed(token.value, { token })
        // save the hashed version of the token
        await this.db.token.updateMany({
            where: { id: token.id },
            data: { value: typeof (hashed) === 'string' ? hashed : hashed.hash },
        })

        // return the token
        return token.value
    }

    async checkToken(token: string): Promise<boolean> {
        // using regex to check if the token is a valid token based on it starting with rn_, followed by a UUID and evt_
        if (!token.match(/^rn_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}evt_.*/)) return false
        // get a hashed version of the token
        let hashed = await this.createHashed(token)
        // check if the hashed token exists on the account by getting the UUID from the token
        const UUID = token.split('evt_')[0]!.split('rn_')[1]
        const account = await this.db.account.findUnique({
            where: {
                id: UUID
            },
            select: {
                apiToken: {
                    where: {
                        value: token,
                        deleted: false,
                    }
                }
            }
        })
        if (!account || !account.apiToken) return false
        return true
    }
}