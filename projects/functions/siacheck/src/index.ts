/**
 * Project: @eventiva/siacheck
 * File: index.ts
 * Path: \src\index.ts
 * Created Date: Saturday, February 26th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sun Feb 27 2022
 * Modified By: Jonathan Stevens
 * Current Version: 2.0.0
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

/**
 * A cloud function that checks if a license is valid against the SIA database. If it is, it returns the license information.
 * Designed to function with the Eventiva project created by Jonathan Stevens.
 * Works with and without database connection.
 * Supports multiple Deployment systems such as Google Cloud Functions, Azure Functions, Lambda and Local Host.
 * Packaged and build with openAPI documentation. Available from $serverdomain$/docs.
 * Built on Express.js and Node.js
 * @version 2.0.0
 * @license GPL-3.0+
 * @packageDocumentation
 */

/**
 * An entry point for Azure Functions.
 * Please instead @see ./Azure/index.ts for the Azure Functions entry point details and preferred entry.
 */
// export { handler as AzureHandler } from './Azure';

/**
 * An entry point for Local Deployments.
 * Please instead @see ./Express/index.ts for the Local Deployments entry point details and preferred entry.
 */
// export { handler as ExpressHandler } from './Express';

/**
 * An entry point for Google Cloud Functions.
 * Please instead @see ./google/index.ts for the Google Cloud Functions entry point details and preferred entry.
 */
export { handler as GoogleHandler } from './Google';

/**
 * An entry point for Lambda Functions.
 * Please instead @see ./Lambda/index.ts for the Lambda Functions entry point details and preferred entry.
 */
// export { handler as LambdaHandler } from './Lambda';

export * from './Controller';
export * from './testlicense';
export * from './util/app';
export * from './util/routes';
export * from './Google/createBucket';
export * from './Google/runCheck';
export * from './Google/uploadImage';
