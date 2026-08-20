/**
 * 커스텀 닉네임이 없는 유저의 소셜 로그인 기본 닉네임(실명일 수 있음)을
 * 가려서 보여준다: "박민성" → "박x성", "이수" → "이x", "김" → "김".
 * 가운데 글자를 전부 x 하나로 뭉개고(정확한 길이를 드러내지 않기 위해),
 * 2자는 뒷글자만, 1자는 그대로 둔다.
 */
export function maskName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return `${trimmed[0]}x`;
  return `${trimmed[0]}x${trimmed[trimmed.length - 1]}`;
}
