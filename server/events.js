import { EventEmitter } from 'events';

export const emitter = new EventEmitter();

// Helper types (JSDoc) for better editor intellisense
/**
 * @typedef {Object} Ticket
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} priority
 * @property {string|null} category
 * @property {string|null} file_url
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} user_id
 * @property {string|null} assigned_to
 * @property {string|null} assignment_status
 */

/**
 * @typedef {Object} TicketMessage
 * @property {string} id
 * @property {string} ticket_id
 * @property {string} user_id
 * @property {string} message
 * @property {boolean} is_admin_message
 * @property {string|null} file_url
 * @property {boolean} is_read
 * @property {string} created_at
 * @property {string} updated_at
 */

// Emitted events (all payloads are wrapped objects to allow future extension)
// emitter.emit('ticketCreated', { ticket: Ticket })
// emitter.emit('ticketUpdated', { ticket: Ticket })
// emitter.emit('ticketClosed', { ticket: Ticket })
// emitter.emit('messageCreated', { message: TicketMessage, ticket: Ticket })

// Consumers:
// - WebSocket hub (in server/index.js) subscribes to these and forwards to connected clients