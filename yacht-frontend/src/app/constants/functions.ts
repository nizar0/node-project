
import Swal, {SweetAlertResult} from "sweetalert2";

export function showAlert(data: any): Promise<SweetAlertResult> {
  const classIcon = data.classIcon || ''
  return Swal.fire({
    icon: data?.icon || '',
    title: data.title || '',
    html: `<div style="text-align: justify; color: #ffff !important; font-family: Fredoka, sans-serif !important; font-size: 18px;">${data.html}</div>`,
    confirmButtonText: data.confirmButtonText || 'Confirmer',
    cancelButtonText: data.cancelButtonText || 'Annuler',
    cancelButtonColor: data.cancelButtonColor || 'red',
    background: data.background || 'linear-gradient(135deg, #1e1e33, #ececec)',
    width: data.width || '500',
    showCancelButton: data.showCancelButton || false,
    showConfirmButton: data.showConfirmButton || true,
    confirmButtonColor: data.confirmButtonColor || '#2b76a3',
    showLoaderOnConfirm: data?.showLoaderOnConfirm,
    showLoaderOnDeny: data?.showLoaderOnDeny,
    preConfirm: data?.preConfirm,
    customClass: {
      container: "custom-swal-container-class",
      icon: classIcon
    },
    showDenyButton: data?.showDenyButton || false,
    denyButtonText: data?.denyButtonText || '',
    denyButtonColor: data?.denyButtonColor || '',
    allowOutsideClick: data?.allowOutsideClick || false,
    input: data?.input,
    inputOptions: data?.inputOptions,
    inputPlaceholder: data?.inputPlaceholder,
    toast: data?.toast || false,
  });
}
export function getUrl(url: string | File): string {

  if(typeof url !== "string" || url?.includes('data:image/png;base64')){
    return <string>url;
  }
  if (!url || typeof url !== 'string') {
    return '';
  } else {
    if (url.startsWith('http://localhost:3001/uploads'))
      return new URL(url).href;
    else if (url.startsWith('http://localhost:3001'))
      return new URL(url).href;
    else
      return new URL('http://localhost:3001'  + url).href;
  }
}
export function getUrlToSideBar(url: string | File): string {

  if(typeof url !== "string" || url?.includes('data:image/png;base64')){
    return <string>url;
  }
  if (!url || typeof url !== 'string') {
    return '';
  } else {
    if (url.startsWith('http://localhost:3001/uploads'))
      return new URL(url).href;
    else if (url.startsWith('http://localhost:3001'))
      return new URL(url).href;
    else
      return new URL('http://localhost:3001'  + url).href;
  }
}
