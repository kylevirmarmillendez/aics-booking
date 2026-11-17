'use client';

export interface AssistanceType { code: string; name: string; requirements: string[] }
export interface BookingOffice {
  slug: string; name: string; officeType: string; province: string; city: string; address: string;
  contacts: string[]; dailyCapacity: number; amCapacity: number; pmCapacity: number;
}
export type BookingStatus = 'Pending' | 'Confirmed' | 'Arrived' | 'No-show' | 'Completed' | 'Cancelled';
export interface BookingRules {
  minDate: string; maxDate: string; weekendDays: number[]; holidays: Array<{ date: string; name: string }>;
  timeSlots: string[]; dailyCapacity: number; timeSlotCapacity: number; available: boolean;
}
export interface Availability {
  selectedDate: string; officeSlug: string; officeName: string; availableSlots: string[];
  periodRemaining: Record<string, number>; remainingSlots: number; dailyCapacity: number;
  periodCapacities: Record<string, number>; isFullyBooked: boolean;
}
export interface PublicAppointment {
  appointmentCode: string; assistanceType: string; officeSlug: string; officeName: string;
  fullName: string; firstName: string; middleName: string; lastName: string; birthdate: string;
  email: string; cellNumber: string; appointmentDate: string; timeSlot: string; status: BookingStatus;
  cancellationReason: string; canCancel: boolean; remainingSlots?: number; dailyCapacity?: number;
}
interface Envelope<T> { success: boolean; message?: string; data?: T; errors?: Array<{ field?: string; message: string }>; dateUnavailable?: boolean }
export class BookingApiError extends Error {
  constructor(message: string, public readonly dateUnavailable = false) { super(message); this.name = 'BookingApiError'; }
}

const API = '/backend-api/public-booking';

async function getCsrfToken(): Promise<string> {
  const response = await fetch('/backend-api/auth/csrf', { credentials: 'include', cache: 'no-store' });
  let body: Envelope<{ csrfToken: string }>;
  try { body = await response.json() as Envelope<{ csrfToken: string }>; }
  catch { throw new BookingApiError('Could not reach the booking service. Check that the API is running.'); }
  if (!response.ok || !body.success || !body.data?.csrfToken) throw new BookingApiError(body.message || 'Unable to start a secure booking request.');
  return body.data.csrfToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() ?? 'GET';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = await getCsrfToken();
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { ...options, credentials: 'include', cache: 'no-store', headers: { ...headers, ...options.headers } });
  } catch { throw new BookingApiError('Cannot reach the appointment service. Please try again later.'); }
  let payload: Envelope<T>;
  try { payload = await response.json() as Envelope<T>; }
  catch { throw new BookingApiError(response.status >= 500 ? 'The booking service is temporarily unavailable.' : `The booking service returned an invalid response (${response.status}).`); }
  if (!response.ok || !payload.success) throw new BookingApiError(payload.errors?.[0]?.message || payload.message || `Booking request failed (${response.status}).`, payload.dateUnavailable ?? false);
  return payload.data as T;
}

export const getBookingRules = () => request<BookingRules>('/calendar-rules');
export const getAssistanceTypes = () => request<AssistanceType[]>('/assistance-types');
export const getBookingOffices = () => request<BookingOffice[]>('/offices');
export const getAvailability = (date: string, officeSlug: string) => {
  const params = new URLSearchParams({ date, officeSlug });
  return request<Availability>(`/availability?${params.toString()}`);
};
export function createBooking(input: {
  typeOfAssistance: string; officeSlug: string; firstName: string; middleName: string; lastName: string;
  birthdate: string; cellNumber: string; email: string; appointmentDate: string; timeSlot: string;
}) { return request<PublicAppointment>('', { method: 'POST', body: JSON.stringify(input) }); }
export const lookupBooking = (input: { appointmentCode: string; cellNumber: string }) =>
  request<{ appointment: PublicAppointment }>('/lookup', { method: 'POST', body: JSON.stringify(input) });
export const cancelBooking = (input: { appointmentCode: string; cellNumber: string; cancellationReason: string }) =>
  request<{ appointment: PublicAppointment }>('/cancel', { method: 'POST', body: JSON.stringify(input) });
