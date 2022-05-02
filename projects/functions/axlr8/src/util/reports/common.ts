export type AdminContactProfiles = number
export type ContactProfiles = number
export type OrganisationLookups = number
export type SiteInformation = number
import { Lookups } from "./Lookups"


export interface LookupsUnformated {
    type: 'AdminContactProfiles' // LU_LKH_CONTACTS_ + number (_Date)
    | 'ContactProfiles' // LU_LKH_CONTACTS_ + number (_Date)
    | 'OrganisationLookups' // LU_LKH_ORG_ + number (_Date)
    | 'SiteInformation'// LU_LKH_SITE_ + number (_Date)
    value: number
}

export type Common = LookupsUnformated | Lookups

export default Common