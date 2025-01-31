export enum GuestFields {
    id = 'id',
    name = 'name',
    description = 'description',
    whatsapp = 'whatsapp',
    can_confirm = 'can_confirm',
    relation = 'relation',
  }

export enum GuestStateFields {
    guest_id = 'guest_id',
    seat = 'seat',
    code = 'code',
    status = 'status',
    message = 'message',
    acknowledged = 'acknowledged',
    updated_at = 'updated_at',
    created_at = 'created_at',
  }
  /**
   * status explanation:
   * to_be_invited: convidado não confirmou presença
   * attending: convidado confirmou presença
   * not_attending: convidado não estará presente
   * acknowledged: link de confirmação foi enviado ao convidado
   * awaiting_accept: convidado ainda não aceitou o convite mesmo após abrir o link de confirmação ou alguém aceitou em seu lugar.
   * rejected: convidado foi retirado da lista de convidados
   */
  export enum GuestStatus {
    all= 'all',
    to_be_invited= 'to_be_invited',
    attending= 'attending',
    attending_name_check_pending= 'attending_name_check_pending',
    not_attending= 'not_attending',
    not_attending_message_pending= 'not_attending_message_pending',
    acknowledged= 'acknowledged',
    awaiting_accept= 'awaiting_accept',
  }