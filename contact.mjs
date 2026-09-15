// Encode the entire subject/body. User input never becomes a recipient or header.
export function composeMessage(fields,language='es') {
 const clean=value=>String(value||'').trim();
 const en=language==='en';
 const body=[`${en?'Name':'Nombre'}: ${clean(fields.name)}`,`Email: ${clean(fields.email)}`,`${en?'Phone':'Teléfono'}: ${clean(fields.phone)}`,fields.package?`${en?'Package':'Paquete'}: ${clean(fields.package)}`:'','',clean(fields.message)].filter((x,i)=>x||i===4).join('\n');
 return {body,url:`mailto:reservas@el-varadero.com?subject=${encodeURIComponent('Varadero · '+clean(fields.topic))}&body=${encodeURIComponent(body)}`};
}
