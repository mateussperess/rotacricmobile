export function formatImageUrl(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;

  const trimmed = path.trim();
  const baseUrl = process.env.MEDIA_BASE_URL || 'https://projetocric-django.onrender.com/media/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Se o caminho contiver o endereço antigo da universidade, reescreve para a nova URL de mídia
  if (trimmed.includes('rota-cric.charqueadas.ifsul.edu.br/media/')) {
    const relativePart = trimmed.split('rota-cric.charqueadas.ifsul.edu.br/media/')[1];
    const cleanRelative = relativePart.startsWith('/') ? relativePart.slice(1) : relativePart;
    return `${cleanBase}${cleanRelative}`;
  }

  // Se for uma URL completa HTTP/HTTPS (e não do servidor antigo)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Para caminhos relativos (ex: cities/images/... ou /media/cities/...)
  let cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  if (cleanPath.startsWith('media/')) {
    cleanPath = cleanPath.slice(6);
  }

  return `${cleanBase}${cleanPath}`;
}
