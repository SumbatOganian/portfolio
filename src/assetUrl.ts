// Keep runtime-loaded public assets inside the deployment base path.
export const assetUrl=(path:string)=>`${import.meta.env.BASE_URL}${path.replace(/^\/+/,'')}`;
