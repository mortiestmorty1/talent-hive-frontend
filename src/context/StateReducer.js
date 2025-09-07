import { reducerCases } from "./constants";

export const initialState = {
  showLoginModal: false,
  showSignupModal: false,
  userInfo: undefined,
  profileExtra: { skills: [], certifications: [], portfolio: [] },
  isSeller: false,
  gigData: undefined,
  hasOrdered: false,
  reloadReviews: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.TOGGLE_LOGIN_MODAL:
      return {
        ...state,
        showLoginModal: action.showLoginModal,
      };
    case reducerCases.TOGGLE_SIGNUP_MODAL:
      return {
        ...state,
        showSignupModal: action.showSignupModal,
      };
    case reducerCases.CLOSE_AUTH_MODAL:
      return {
        ...state,
        showLoginModal: false,
        showSignupModal: false,
      };
    case reducerCases.SET_USER:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCases.SWITCH_MODE:
      return {
        ...state,
        isSeller: !state.isSeller,
      };
    case reducerCases.SET_GIG_DATA:
      return {
        ...state,
        gigData: action.gigData,
      };
    case reducerCases.HAS_USER_ORDERED_GIG:
      return {
        ...state,
        hasOrdered: action.hasOrdered,
      };
    case reducerCases.ADD_REVIEW:
      return {
        ...state,
        gigData: {
          ...state.gigData,
          reviews: [...state.gigData.reviews, action.newReview],
        },
      };
    case reducerCases.SET_PROFILE_EXTRA:
      return {
        ...state,
        profileExtra: action.profileExtra,
      };
    case reducerCases.ADD_SKILL:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          skills: [...state.profileExtra.skills, action.skill],
        },
      };
    case reducerCases.UPDATE_SKILL:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          skills: state.profileExtra.skills.map((s, i) => (i === action.index ? action.skill : s)),
        },
      };
    case reducerCases.REMOVE_SKILL:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          skills: state.profileExtra.skills.filter((_, i) => i !== action.index),
        },
      };
    case reducerCases.ADD_CERTIFICATION:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          certifications: [...state.profileExtra.certifications, action.certification],
        },
      };
    case reducerCases.UPDATE_CERTIFICATION:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          certifications: state.profileExtra.certifications.map((c, i) => (i === action.index ? action.certification : c)),
        },
      };
    case reducerCases.REMOVE_CERTIFICATION:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          certifications: state.profileExtra.certifications.filter((_, i) => i !== action.index),
        },
      };
    case reducerCases.ADD_PORTFOLIO_ITEM:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          portfolio: [...state.profileExtra.portfolio, action.item],
        },
      };
    case reducerCases.UPDATE_PORTFOLIO_ITEM:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          portfolio: state.profileExtra.portfolio.map((p, i) => (i === action.index ? action.item : p)),
        },
      };
    case reducerCases.REMOVE_PORTFOLIO_ITEM:
      return {
        ...state,
        profileExtra: {
          ...state.profileExtra,
          portfolio: state.profileExtra.portfolio.filter((_, i) => i !== action.index),
        },
      };
    default:
      return state;
  }
};

export default reducer;
