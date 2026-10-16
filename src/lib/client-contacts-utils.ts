export interface ClientContact {
  id: string;
  name: string;
  role?: string;
  phone: string;
}

const CONTACTS_TAG_START = '<!-- CONTACTS_JSON:';
const CONTACTS_TAG_END = ':CONTACTS_END -->';

/**
 * Extrai os contatos/sócios extras das observações do cliente
 */
export function extractContactsFromNotes(notes: string | null | undefined): ClientContact[] {
  if (!notes) return [];

  const startIndex = notes.indexOf(CONTACTS_TAG_START);
  const endIndex = notes.indexOf(CONTACTS_TAG_END);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return [];
  }

  try {
    const jsonStr = notes.substring(startIndex + CONTACTS_TAG_START.length, endIndex).trim();
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao ler contatos embutidos:', err);
  }

  return [];
}

/**
 * Retorna apenas o texto limpo das observações do cliente, removendo o bloco de contatos embutido
 */
export function extractCleanNotes(notes: string | null | undefined): string {
  if (!notes) return '';

  const startIndex = notes.indexOf(CONTACTS_TAG_START);
  const endIndex = notes.indexOf(CONTACTS_TAG_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = notes.substring(0, startIndex);
    const after = notes.substring(endIndex + CONTACTS_TAG_END.length);
    return (before + after).trim();
  }

  return notes.trim();
}

/**
 * Empacota as notas visíveis e os contatos adicionais em uma única string segura para salvar no banco
 */
export function combineNotesAndContacts(cleanNotes: string, contacts: ClientContact[]): string {
  const trimmedNotes = cleanNotes.trim();
  const validContacts = contacts.filter((c) => c.name.trim() || c.phone.trim());

  if (validContacts.length === 0) {
    return trimmedNotes;
  }

  const contactsBlock = `${CONTACTS_TAG_START}${JSON.stringify(validContacts)}${CONTACTS_TAG_END}`;

  if (!trimmedNotes) {
    return contactsBlock;
  }

  return `${trimmedNotes}\n\n${contactsBlock}`;
}
