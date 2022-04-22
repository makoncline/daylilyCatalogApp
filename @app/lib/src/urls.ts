export const catalogUrl = `/catalog`;
export const pricingUrl = `/pricing`;
export const usersUrl = `/users`;
export const listsUrl = `/lists`;
export const createListUrl = `${listsUrl}/create`;
export const settingsUrl = `/settings`;
export const membershipUrl = `/membership`;
export const loginUrl = `/login`;
export const registerUrl = `/register`;
export const forgotUrl = `/forgot`;
export const resetUrl = `/reset`;
export const deleteUrl = `${settingsUrl}/delete`;
export const emailsUrl = `${settingsUrl}/emails`;
export const securityUrl = `${settingsUrl}/security`;

export function toViewListingUrl(id: number) {
  return `${catalogUrl}/${id}`;
}
export function toCreateListingUrl() {
  return `${catalogUrl}/create`;
}
export function toEditListingUrl(id: number) {
  return `${catalogUrl}/edit/${id}`;
}
export function toEditListUrl(id: number) {
  return `${listsUrl}/edit/${id}`;
}
