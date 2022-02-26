/**
 * File: index.ts
 * Project: @eventiva/siacheck
 * Created Date: Monday, January 24th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Fri Feb 25 2022
 * Modified By: Jonathan Stevens
 * -----
 * Copyright (c) 2022 Resnovas
 * -----
 * LICENSE: GNU General Public License v3.0 or later
 *
 * This program has been provided under confidence of the author and is licensed
 * under the terms of the GNU General Public License v3.0 or later as published as
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, see http://www.gnu.org/licenses/gpl-3.0-standalone.html
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
