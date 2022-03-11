import { AuditBooking } from './AuditBooking';
import { AuditLog } from './AuditLog';
import { AuditStaffActivity } from './AuditStaffActivity';
import { CompaniesSitesContracts } from './CompaniesSitesContracts';
import { EventSessionBooking } from './EventSessionBooking';
import { QuestionnaireResponse } from './QuestionnaireResponses';
import { stelify } from './stelify'

export type filter = stelify | AuditBooking | AuditLog | AuditStaffActivity | CompaniesSitesContracts | EventSessionBooking | QuestionnaireResponse;
