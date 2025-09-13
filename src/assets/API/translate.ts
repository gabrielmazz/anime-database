// Helper de tradução simples usando serviços públicos.
// Primário: MyMemory (não requer chave). Fallback: LibreTranslate (instância pública).
// Observação: Serviços públicos possuem limites de uso (rate limit). Para produção,
// considere usar uma chave própria ou um back‑end dedicado.

/**
 * Traduz um texto de um idioma origem para um destino.
 *
 * - Divide o texto em partes menores (chunks) para respeitar limites de API.
 * - Tenta primeiro o MyMemory (GET), depois faz fallback para o LibreTranslate (POST).
 * - Em qualquer falha, retorna o texto original para não quebrar a UI.
 *
 * @param text Texto original a ser traduzido
 * @param from Idioma de origem (ex.: 'en')
 * @param to   Idioma de destino (ex.: 'pt-BR')
 */
export async function translateText(
  text: string,
  from: string = 'en',
  to: string = 'pt-BR',
): Promise<string> {
	// Curto‑circuito: nada para traduzir
	if (!text || !text.trim()) return text;

	// MyMemory limita ~500 caracteres no parâmetro `q`. Usamos 480 por segurança
	// e quebramos o texto previamente para evitar erros de limite.
	const MAX_CHARS = 480;
	const chunks = splitIntoChunks(text, MAX_CHARS);

	// 1) Tentativa com MyMemory (requisições GET por chunk)
	try {
		const translated: string[] = [];
		for (const part of chunks) {
			const url = new URL('https://api.mymemory.translated.net/get');
			url.searchParams.set('q', part);
			url.searchParams.set('langpair', `${from}|${to}`);
			const res = await fetch(url.toString());
			if (!res.ok) throw new Error('mymemory failed');
			const data = await res.json();
			const out = data?.responseData?.translatedText as string | undefined;
			translated.push(out || part); // fallback ao chunk original caso não venha texto
		}
		return joinChunks(translated);
	} catch (_) {
		// Se falhar (rate limit, CORS, etc.), tentamos o fallback abaixo
	}

	// 2) Fallback com LibreTranslate (POST por chunk)
	try {
		const translated: string[] = [];
		for (const part of chunks) {
			const res = await fetch('https://libretranslate.de/translate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					q: part,
					source: normalizeLang(from), // normaliza 'pt-BR' -> 'pt'
					target: normalizeLang(to),   // normaliza 'en-US' -> 'en'
					format: 'text',
				}),
			});
			if (!res.ok) throw new Error('libretranslate failed');
			const data = await res.json();
			const out = data?.translatedText as string | undefined;
			translated.push(out || part);
		}
		return joinChunks(translated);
	} catch (_) {
		// Falha total: devolve o original para manter a app estável
	}

  return text;
}

/**
 * Normaliza códigos de idioma com região (ex.: 'pt-BR'/'en-US') para o código base ('pt'/'en').
 */
function normalizeLang(code: string): string {
  return code.split('-')[0].toLowerCase();
}

export default translateText;

/**
 * Versão detalhada: retorna também se houve tradução (diferença do texto)
 * e qual provedor respondeu.
 */
export async function translateTextDetailed(
  text: string,
  from: string = 'en',
  to: string = 'pt-BR',
): Promise<{ text: string; translated: boolean; provider: 'mymemory' | 'libre' | null }> {
  const original = text ?? '';
  if (!original.trim()) return { text: original, translated: false, provider: null };

  const MAX_CHARS = 480;
  const chunks = splitIntoChunks(original, MAX_CHARS);

  // Try MyMemory
  try {
    const outChunks: string[] = [];
    for (const part of chunks) {
      const url = new URL('https://api.mymemory.translated.net/get');
      url.searchParams.set('q', part);
      url.searchParams.set('langpair', `${from}|${to}`);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('mymemory failed');
      const data = await res.json();
      const out = (data?.responseData?.translatedText as string | undefined) ?? part;
      outChunks.push(out);
    }
    const joined = joinChunks(outChunks);
    return {
      text: joined,
      translated: normalizeForCompare(joined) !== normalizeForCompare(original),
      provider: 'mymemory',
    };
  } catch (_) {}

  // Fallback LibreTranslate
  try {
    const outChunks: string[] = [];
    for (const part of chunks) {
      const res = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: part,
          source: normalizeLang(from),
          target: normalizeLang(to),
          format: 'text',
        }),
      });
      if (!res.ok) throw new Error('libretranslate failed');
      const data = await res.json();
      const out = (data?.translatedText as string | undefined) ?? part;
      outChunks.push(out);
    }
    const joined = joinChunks(outChunks);
    return {
      text: joined,
      translated: normalizeForCompare(joined) !== normalizeForCompare(original),
      provider: 'libre',
    };
  } catch (_) {}

  return { text: original, translated: false, provider: null };
}

// ============ Funções auxiliares ============

/**
 * Divide o texto em pedaços de tamanho máximo `max`, tentando respeitar
 * fronteiras naturais (pontuação/espaço) próximas ao limite para não
 * quebrar frases no meio.
 */
function splitIntoChunks(text: string, max: number): string[] {
	if (text.length <= max) return [text];
	const parts: string[] = [];
	let i = 0;
	while (i < text.length) {
		const end = Math.min(i + max, text.length);
		let slice = text.slice(i, end);
		if (end < text.length) {
			// Procura um ponto de quebra (pontuação/espaço) perto do fim do chunk
			const breakPos = findBreakPosition(slice);
			if (breakPos > 0) slice = slice.slice(0, breakPos);
		}
		parts.push(slice.trim());
		i += slice.length;
	}
	return parts;
}

/**
 * Encontra uma posição de quebra próxima ao final do chunk, priorizando
 * pontuação ou espaço para minimizar cortes bruscos de palavras/frases.
 */
function findBreakPosition(chunk: string): number {
	const breakChars = ['.', '!', '?', ';', ':', ',', ' ', '\\n'];
	for (let offset = 0; offset < 80 && offset < chunk.length; offset++) {
		const idx = chunk.length - 1 - offset;
		const ch = chunk[idx];
		if (breakChars.includes(ch)) return idx + 1; // inclui o caractere de quebra
	}
	return -1;
}

/**
 * Junta os chunks traduzidos em um único texto, colapsando múltiplos espaços
 * e aparando extremidades para manter a formatação limpa.
 */
function joinChunks(chunks: string[]): string {
  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

function normalizeForCompare(s: string): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}
