/** UUID v4 (mismo criterio que validateUuid en path params). */
export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const esUuidV4 = (value: string): boolean => UUID_V4_REGEX.test(value);
