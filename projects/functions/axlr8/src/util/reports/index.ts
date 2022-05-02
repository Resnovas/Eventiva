import { AuditBooking } from './AuditBooking';
import { AuditLog } from './AuditLog';
import { AuditStaffActivity } from './AuditStaffActivity';
import { Common } from './common';
import { CompaniesSitesContracts } from './CompaniesSitesContracts';
import { EventSessionBooking } from './EventSessionBooking';
import { EventSessionSummary } from './EventSessionSummary';
import { JobApplication } from './JobApplication';
import { JobPostingData } from './JobPostingData';
import { Lookups } from './Lookups';
import { MailingPreview } from './MailingPreview';
import { Products } from './Products';
import { ProductTracking } from './ProductTracking';
import { QuestionnaireResponse } from './QuestionnaireResponses';
import { QuestionnaireSessionLinks } from './QuestionnaireSessionLinks';
import { RBRunAnalysis } from './RBRunAnalysis';
import { SessionQuestionnairesResult } from './SessionQuestionnairesResult'
import { stelify } from './stelify'

export type filter = Common | EventSessionSummary | Lookups | stelify | AuditBooking | AuditLog | AuditStaffActivity | CompaniesSitesContracts | EventSessionBooking | QuestionnaireResponse | JobApplication | JobPostingData | MailingPreview | Products | ProductTracking | QuestionnaireSessionLinks | RBRunAnalysis | SessionQuestionnairesResult;
