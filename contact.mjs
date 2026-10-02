// Encode the entire subject/body. User input never becomes a recipient or header.
export function composeMessage(fields,language='es') {
 const clean=value=>String(value||'').trim();
 const w={es:['Nombre','Teléfono','Paquete'],en:['Name','Phone','Package'],fr:['Nom','Téléphone','Forfait']}[language]||['Nombre','Teléfono','Paquete'];
 const body=[`${w[0]}: ${clean(fields.name)}`,`Email: ${clean(fields.email)}`,`${w[1]}: ${clean(fields.phone)}`,fields.package?`${w[2]}: ${clean(fields.package)}`:'','',clean(fields.message)].filter((x,i)=>x||i===4).join('\n');
 return {body,url:`mailto:reservas@el-varadero.com?subject=${encodeURIComponent('Varadero · '+clean(fields.topic))}&body=${encodeURIComponent(body)}`};
}
