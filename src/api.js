/**
 * Get all candidate data.
 *
 * @param {string} url - The API URL.
 * @param {Object} params - The request parameters.
 * @return {Promise<Object>} - A promise that resolves to the candidate data.
 */
const getCandidates = async (url, params) => {
  return fetch(`${url}?p=candidates`)
    .then(response => response.json())
    .catch(error => new Error(error));
}

/**
 * Log in to check the token.
 *
 * @param {string} url - The API URL.
 * @param {Object} params - The request parameters.
 * @return {Promise<Object>} - A promise that resolves to the login response.
 */
const login = async (url, params) => {
  const { token } = params;

  return fetch(`${url}?p=login&token=${token}`)
    .then(response => response.json())
    .catch(error => new Error(error));
}

/**
 * Vote for a candidate.
 *
 * @param {string} url - The API URL.
 * @param {Object} params - The request parameters.
 * @return {Promise<Object>} - A promise that resolves to the voting response.
 */
const vote = async (url, params) => {
  const { token, head, vice } = params;

  return fetch(`${url}?p=vote&token=${token}&head=${head}&vice=${vice}`)
    .then(response => response.json())
    .catch(error => new Error(error));
}

export default {
  getCandidates,
  login,
  vote,
}