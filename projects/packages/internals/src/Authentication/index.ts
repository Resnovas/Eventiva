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

import { PrismaClient } from '@prisma/client';
import { Database } from '../database';
import { Account, TokenType } from '../database/generated';
import crypto from 'crypto';
import jwt, { KeyLike } from 'jose';

export interface Salted extends Salt {
  hash: string;
}
export interface Salt {
  salt: string;
  expiry: Date;
}

export class Authentication {
  private d: Database;
  private db: PrismaClient;

  constructor(d: Database) {
    this.d = d;
    this.db = this.d.db;
  }
  public create = {
    /**
     * Creates a hashed object for accounts and tokens.
     * This should be used only by internal systems and can result in inconsistent user accessability if used incorrectly.
     * @internal
     * @since 0.0.5
     * @author Jonathan Stevens
     */
    authentication: async (
      account: Account,
      password: string,
      expiryDays: number = 90
    ) => {
      const Account = await this.db.account.findUnique({
        where: {
          id: account.id,
        },
        select: {
          publicKey: true,
          secretKey: true,
          apiToken: {
            select: {
              publicKey: true,
            },
          },
        },
      });
      if (!Account) throw new Error('Account not found');
      if (Account.secretKey)
        throw new Error(
          'Account already has secret key, you must use the reset function instead'
        );
      // create expiry with expiryDays
      let expiry = new Date();
      expiry.setDate(expiry.getDate() + expiryDays);
      // create a token from jwt specification
      const Password = await jwt.generateKeyPair('RSA-OAEP-384', {
        extractable: true,
      });
      const Encryption = await jwt.generateKeyPair('RSA-OAEP-384', {
        extractable: true,
      });
      // Public Key Export
      const PasswordPublicKeyString = await jwt.exportSPKI(Password.publicKey);
      const EncryptionPublicKeyString = await jwt.exportSPKI(
        Encryption.publicKey
      );
      // Private Key Export
      const PasswordPrivateKeyString = await jwt.exportPKCS8(
        Password.privateKey
      );
      const EncryptionPrivateKeyString = await jwt.exportPKCS8(
        Encryption.privateKey
      );
      // create the token class
      // create a salt string from the account information
      let salt =
        account.createdAt.getMilliseconds() / account.createdAt.getDay() +
        password +
        process.env.ENCRYPTION_SALT;
      // mix up the salt string
      salt = salt.split('').sort().join('');

      const secretRecipient = await new jwt.GeneralEncrypt(
        new TextEncoder().encode(EncryptionPrivateKeyString)
      )
        .setProtectedHeader({ enc: 'A256GCM' })
        .addRecipient(Password.publicKey)
        .setUnprotectedHeader({ alg: 'RSA-OAEP-384' });

      Account.apiToken.forEach(async (token) => {
        if (!token.publicKey) return;
        return secretRecipient
          .addRecipient(await jwt.importSPKI(token.publicKey, 'RSA-OAEP-384'))
          .setUnprotectedHeader({ alg: 'RSA-OAEP-384' });
      });

      const EncryptionKeyEncrypted = await secretRecipient.encrypt();
      const PasswordSecretJWT = await new jwt.SignJWT({
        'urn:eventiva:login': true,
      })
        .setProtectedHeader({ alg: 'ES256' })
        .setIssuedAt()
        .setIssuer('urn:resnovas:eventiva')
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(salt));

      const token = await this.db.account.update({
        where: {
          id: account.id,
        },
        data: {
          secretKey: String(EncryptionKeyEncrypted),
          publicKey: EncryptionPublicKeyString,
          passwordPublic: PasswordPublicKeyString,
          passwordSecret: PasswordSecretJWT,
        },
      });
      if (!token || !token.publicKey || !token.secretKey)
        throw new Error('Failed to create token');
      return true;
    },

    /**
     * Creates a token then stores it on the users account.
     * @internal
     * @since 0.0.5
     * @author Jonathan Stevens
     * @param account - The account of the user creating the token
     * @param expiryDays - The days before expiry the token should be valid for
     * @param type - The token type to be created
     */
    token: async (
      nickname: string,
      account: Account,
      expiryDays: number = 90,
      type: TokenType
    ) => {
      // create expiry with expiryDays
      let expiry = new Date();
      expiry.setDate(expiry.getDate() + expiryDays);
      // create a token from jwt specification
      const { publicKey, privateKey } = await jwt.generateKeyPair(
        'RSA-OAEP-384',
        { extractable: true }
      );
      // Public Key Export
      const StringKey = await jwt.exportSPKI(publicKey);
      // Private Key Export
      const PrivateStringKey = await jwt.exportPKCS8(privateKey);
      const PrivateKey = PrivateStringKey.split(
        '-----BEGIN PRIVATE KEY-----'
      )[1]?.replace('-----END PRIVATE KEY-----', '');
      // create the token class
      const token = await this.db.token.create({
        data: {
          type,
          expiry,
          account: { connect: { id: account.id } },
          publicKey: StringKey,
          nickname,
        },
      });
      if (!token || !token.publicKey) throw new Error('Failed to create token');
      // return the token
      return 'rn_' + account.prn + 'ent_' + PrivateKey;
    },
  };

  public read = {
    privateKey: async (token: string): Promise<boolean> => {
      // using regex to check if the token is a valid token based on it starting with rn_, followed by a UUID and evt_
      if (!token.match(/^rn_[0-9]+evt_.*/)) return false;
      // check if the hashed token exists on the account by getting the UUID from the token
      const parts = token.split('evt_');
      const prn = Number(parts[0]?.split('rn_')[1]);
      const account = await this.db.account.findFirst({
        where: {
          prn,
        },
        select: {
          secretKey: true,
        },
      });
      const PrivateKey = await jwt.importPKCS8(
        '-----BEGIN PRIVATE KEY-----' + parts[1] + '-----END PRIVATE KEY-----',
        'RSA-OAEP-384'
      );
      if (!account || !account.secretKey || !PrivateKey) return false;
      try {
        jwt.generalDecrypt(
          account.secretKey as unknown as jwt.GeneralJWE,
          PrivateKey
        );
        return true;
      } catch (error) {
        return false;
      }
    },
  };
}
