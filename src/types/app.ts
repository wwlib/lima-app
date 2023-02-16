export enum EnvironmentType {
    Production = 'production',
    Test = 'test'
}

export interface UserData {
    accountId: string
}

export interface InputData {
    clientId: string;
    appName: string;
    accountId: string;
    sessionId: string;
    environment: EnvironmentType;
    type: QuestionType | undefined;
    top: number;
    scoreThreshold: number;
    category: string;
    question: string;
    inputData: string;
}

export type TransactionData = {
    id: string
    type: string
    serviceType: string;
    appName: string;
    clientId: string;
    accountId: string;
    sessionId: string;
    appVersion: string;
    datestamp: number;
    input: string;
    category: string;
    intentId: string;
    intentDetail: string;
    confidence: number;
    responseText: string;
    response: any
}

export type AnnotationData = {
    id: string
    type: string
    clientId: string
    appName: string
    serviceType: string
    accountId: string
    sessionId: string
    transactionId: string
    status: string
    issueType: string
    priority: string
    assignedTo: string
    intentId: string
    category: string
    deidentifiedInput: string
    notes: string
    jiraIds: string
    appSpecificData: any
    annotationAccountId: string
    datestamp: number
    datestampModified: number
    revision: number
}

export type AccountId = string
export type Metadata = {
    key: string
    appName: string
    appVersion: string
    serviceType: string
    intents: any[],
    categories: any[],
    isDefault: boolean
}

export enum QuestionType {
    Qa = 'qa',
    User = 'user',
    Auto = 'auto'
}

export enum AnnotationStatus {
    Open = 'open',
    Triaged = 'triaged',
    Fixed = 'fixed',
    WontFix = 'wontfix',
    Verified = 'verified',
    Closed = 'closed',
    Deleted = 'deleted',
}

export enum IssueType {
    WrongAnswer = 'wronganswer',
    MissingAnswer = 'missinganswer',
    InadequateAnswer = 'inadequateanswer',
    Other = 'other',
    NoIssue = 'noissue',
}

export enum PriorityType {
    Low = 'low',
    High = 'high',
    Urgent = 'urgent',
    Critical = 'critical',
}

export type SearchResultsData = {
    database: string;
    status: string;
    result: TransactionData[] | AnnotationData[];
};

export type AnnotationResultsData = {
    status: string;
    result: TransactionData[] | AnnotationData[];
};