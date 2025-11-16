export const HOST = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4003";
export const API_URL = `${HOST}/api`;
export const IMAGES_URL = `${HOST}/uploads`;

export const AUTH_ROUTES = `${API_URL}/auth`;
export const GIG_ROUTES = `${API_URL}/gigs`;
export const ORDER_ROUTES = `${API_URL}/orders`;
export const MESSAGE_ROUTES = `${API_URL}/messages`;
export const USER_ROUTES = `${API_URL}/user`;
export const JOB_ROUTES = `${API_URL}/jobs`;
export const CATEGORY_ROUTES = `${API_URL}/categories`;
export const DISPUTE_ROUTES = `${API_URL}/disputes`;
export const DASHBOARD_DATA_ROUTES = `${API_URL}/dashboard`;

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/get-user-info`;
export const SET_USER_INFO = `${AUTH_ROUTES}/set-user-info`;
export const SET_USER_IMAGE = `${AUTH_ROUTES}/set-user-image`;

// Category Routes
export const GET_JOB_CATEGORIES = `${CATEGORY_ROUTES}/jobs`;
export const GET_GIG_CATEGORIES = `${CATEGORY_ROUTES}/gigs`;
export const GET_ALL_CATEGORIES = `${CATEGORY_ROUTES}/all`;

export const ADD_GIG_ROUTE = `${GIG_ROUTES}/add`;
export const GET_ALL_USER_GIGS_ROUTE = `${GIG_ROUTES}`;
export const GET_GIG_BY_ID_ROUTE = `${GIG_ROUTES}/get`;
export const UPDATE_GIG_ROUTE = `${GIG_ROUTES}/edit`;
export const SEARCH_GIGS_ROUTE = `${GIG_ROUTES}/search`;
export const CHECK_USER_ORDERED_GIG_ROUTE = `${GIG_ROUTES}/check-gig-order`;
export const ADD_REVIEW_ROUTE = `${GIG_ROUTES}/review`;

export const CREATE_ORDER = `${ORDER_ROUTES}/create`;
export const CONFIRM_ORDER = `${ORDER_ROUTES}/confirm`;
export const ORDER_SUCCESS = `${ORDER_ROUTES}/success`;
export const GET_BUYER_ORDERS = `${ORDER_ROUTES}/get-buyer-orders`;
export const GET_SELLER_ORDERS = `${ORDER_ROUTES}/get-seller-orders`;

export const GET_MESSAGES = `${MESSAGE_ROUTES}/get-messages`;
export const SEND_MESSAGE = `${MESSAGE_ROUTES}/send-message`;
export const GET_UNREAD_MESSAGES = `${MESSAGE_ROUTES}/unread-messages`;
export const MARK_AS_READ_ROUTE = `${MESSAGE_ROUTES}/mark-as-read`;

// Job Messaging
export const SEND_JOB_MESSAGE = `${MESSAGE_ROUTES}/send-job-message`;
export const GET_JOB_MESSAGES = `${MESSAGE_ROUTES}/get-job-messages`;

export const GET_SELLER_DATA = `${DASHBOARD_DATA_ROUTES}/seller`;
export const GET_BUYER_DATA = `${DASHBOARD_DATA_ROUTES}/buyer`;
export const GET_DASHBOARD_DATA = `${DASHBOARD_DATA_ROUTES}/`;

// Enhanced Profile
export const GET_PROFILE_EXTRA = `${USER_ROUTES}/profile/extra`;

export const SKILLS_ROUTE = `${USER_ROUTES}/skills`;
export const CERTIFICATIONS_ROUTE = `${USER_ROUTES}/certifications`;
export const PORTFOLIO_ROUTE = `${USER_ROUTES}/portfolio`;

// Jobs & Applications
export const CREATE_JOB_ROUTE = `${JOB_ROUTES}/create`;
export const GET_ALL_JOBS_ROUTE = `${JOB_ROUTES}/all`;
export const BROWSE_JOBS_ROUTE = `${JOB_ROUTES}/browse`;
export const SEARCH_JOBS_ROUTE = `${JOB_ROUTES}/search`;
export const GET_JOB_APPLICATIONS_ROUTE = `${JOB_ROUTES}`; // use as `${GET_JOB_APPLICATIONS_ROUTE}/${jobId}/applications`
export const UPDATE_APPLICATION_STATUS_ROUTE = `${JOB_ROUTES}/applications`; // use as `${UPDATE_APPLICATION_STATUS_ROUTE}/${applicationId}`
export const GET_JOB_ROUTE = `${JOB_ROUTES}/get`; // use as `${GET_JOB_ROUTE}/${jobId}`
export const LIST_CLIENT_JOBS_ROUTE = `${JOB_ROUTES}/client`;
export const APPLY_JOB_ROUTE = `${JOB_ROUTES}/apply`;
export const GET_JOB_MATCHES_ROUTE = `${JOB_ROUTES}/matches`; // use as `${GET_JOB_MATCHES_ROUTE}/${jobId}?limit=10`
export const GET_CLIENT_JOB_ORDERS_ROUTE = `${JOB_ROUTES}/orders/client`;
export const GET_FREELANCER_JOB_ORDERS_ROUTE = `${JOB_ROUTES}/orders/freelancer`;
export const CREATE_JOB_PAYMENT = `${JOB_ROUTES}/payment/create`;
export const CONFIRM_JOB_PAYMENT = `${JOB_ROUTES}/payment/confirm`;
export const UPDATE_JOB_STATUS = `${JOB_ROUTES}/update-status`; // use as `${UPDATE_JOB_STATUS}/${jobId}`
export const UPDATE_JOB_PROGRESS = `${JOB_ROUTES}`; // use as `${UPDATE_JOB_PROGRESS}/${jobId}/progress`
export const GET_JOB_MILESTONES = `${JOB_ROUTES}`; // use as `${GET_JOB_MILESTONES}/${jobId}/milestones`
export const ADD_JOB_MILESTONE = `${JOB_ROUTES}`; // use as `${ADD_JOB_MILESTONE}/${jobId}/milestones`
export const UPDATE_MILESTONE_STATUS = `${JOB_ROUTES}/milestones`; // use as `${UPDATE_MILESTONE_STATUS}/${milestoneId}`
export const COMPLETE_JOB_ROUTE = `${JOB_ROUTES}/complete`; // use as `${COMPLETE_JOB_ROUTE}/${jobId}`

// Gig Workspace
export const GET_ORDER_BY_ID = `${ORDER_ROUTES}/get`; // use as `${GET_ORDER_BY_ID}/${orderId}`
export const GET_GIG_MILESTONES = `${ORDER_ROUTES}`; // use as `${GET_GIG_MILESTONES}/${orderId}/milestones`
export const ADD_GIG_MILESTONE = `${ORDER_ROUTES}`; // use as `${ADD_GIG_MILESTONE}/${orderId}/milestones`
export const UPDATE_GIG_MILESTONE_STATUS = `${ORDER_ROUTES}/milestones`; // use as `${UPDATE_GIG_MILESTONE_STATUS}/${milestoneId}`
export const UPDATE_ORDER_STATUS = `${ORDER_ROUTES}/status`; // use as `${UPDATE_ORDER_STATUS}/${orderId}`
export const COMPLETE_ORDER = `${ORDER_ROUTES}/complete`; // use as `${COMPLETE_ORDER}/${orderId}`

// Disputes
export const OPEN_DISPUTE_ROUTE = `${DISPUTE_ROUTES}/open`;
export const LIST_MY_DISPUTES_ROUTE = `${DISPUTE_ROUTES}/mine`;
export const LIST_ALL_DISPUTES_FOR_MEDIATORS_ROUTE = `${DISPUTE_ROUTES}/all-for-mediators`;
export const GET_DISPUTE_ROUTE = `${DISPUTE_ROUTES}/get`; // use as `${GET_DISPUTE_ROUTE}/${disputeId}`
export const UPLOAD_EVIDENCE_ROUTE = `${DISPUTE_ROUTES}/evidence`; // `${...}/${disputeId}`
export const ASSIGN_MEDIATOR_ROUTE = `${DISPUTE_ROUTES}/assign`; // `${...}/${disputeId}`
export const UPDATE_DISPUTE_STATUS_ROUTE = `${DISPUTE_ROUTES}/status`; // `${...}/${disputeId}`
export const RESOLVE_DISPUTE_ROUTE = `${DISPUTE_ROUTES}/resolve`; // `${...}/${disputeId}`
export const POST_DISPUTE_MESSAGE_ROUTE = `${DISPUTE_ROUTES}/message`; // `${...}/${disputeId}`
