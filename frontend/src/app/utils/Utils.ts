/**
 * Función para formatear una fecha en formato "dd/MM/yyyy" o "yyyy-MM-dd"
 * @param date string con la fecha a formatear
 * @param type tipo de formato a devolver (1: "dd/MM/yyyy", 2: "yyyy-MM-dd")
 * @param date2 fecha de referencia para formatear la fecha actual
 * @returns fecha formateada
 */
export const formatDate = (date: string = "", type: number = 1, date2: Date = new Date()): any =>{
    if(type == 1){
        if(date === ""){
            const pad = (num:any) => String(num).padStart(2, '0');
            const year = date2.getFullYear();
            const month = pad(date2.getMonth() + 1);
            const day = pad(date2.getDate());
            return `${day}/${month}/${year}`;
        }else{
            let parsedDate;
            try{
                let dateL = "";
                let extra = "";
                if(date.includes("T")){
                    [dateL, extra] = date.split('T');
                }
                else{
                    dateL = date;
                }
                const [y, m, d] = dateL.split('-').map(Number);
                parsedDate = new Date(y, m - 1, d);
            }catch{
                parsedDate = new Date(date);
            }
            const day = String(parsedDate.getDate()).padStart(2, '0');
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const year = parsedDate.getFullYear();
            return `${day}/${month}/${year}`;
        }
    }
    else if(type == 2){
        if(date === ""){
            const pad = (num:any) => String(num).padStart(2, '0');
            const year = date2.getFullYear();
            const month = pad(date2.getMonth() + 1);
            const day = pad(date2.getDate());
            return `${year}-${month}-${day}`;
        }else{
            let dateL = date;
            let extra;
            if(date.includes("T")){
                [dateL, extra] = date.split('T');
            }
            const parts = dateL.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    else if(type == 3){
        let dateL = new Date(date+"T00:00:00")
        return dateL;
    }
    else if(type== 4){
        if(date != ""  && date != null){
            const [day, month, year] = date.split('/').map(Number);
            if (!day || !month || !year) return null;
            return new Date(year, month - 1, day);
        }else{return ""}
        
    }
    else{
        const pad = (num:any) => String(num).padStart(2, '0');
        const year = date2.getFullYear();
        const month = pad(date2.getMonth() + 1);
        const day = pad(date2.getDate());
        const hours = pad(date2.getHours());
        const minutes = pad(date2.getMinutes());
        const seconds = pad(date2.getSeconds());

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
};

/**
 * Función para formatear una hora en formato "hh:mm" o "hh:mm AM/PM"
 * @param timeStr string con la hora a formatear
 * @param type tipo de formato a devolver (1: "hh:mm", 2: "hh:mm AM/PM")
 * @param date fecha de referencia para formatear la hora actual
 * @returns hora formateada
 */
export const formatTime = (timeStr: string, type: number = 1, date: Date = new Date()): any =>{
    if(type == 1){
        let [time, modifier] = timeStr.split(' ');

        let [hours, minutes] = time.split(':');
        let Nhours = parseInt(hours, 10);

        if (modifier === 'PM' && Nhours !== 12) {
            Nhours += 12;
        } else if (modifier === 'AM' && Nhours === 12) {
            Nhours = 0;
        }

        const formattedHours = Nhours.toString().padStart(2, '0');
        const formattedMinutes = minutes.padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
    }
    else if (type === 2) {
        let [hours, minutes, seconds] = timeStr.split(':');
        let Nhours = parseInt(hours, 10);
        let modifier = 'AM';
        if (Nhours >= 12) {
            modifier = 'PM';
            if (Nhours > 12) {
                Nhours -= 12;
            }
        } else if (Nhours === 0) {
            Nhours = 12;
        }

        const formattedHours = Nhours.toString();
        const formattedMinutes = minutes.padStart(2, '0');

        return `${formattedHours}:${formattedMinutes} ${modifier}`;
    }
    else if(type == 3){
        let [hours, minutes, seconds] = timeStr.split(':');
        return `${hours}:${minutes}`;
    }
    else{
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
};

/**
 * Función para obtener una imagen aleatoria de una lista de urls
 * @param type tipo de imagen a obtener (1: imagen de perfil, 2: imagen de fondo)
 * @returns url de la imagen aleatoria
 */
export const randomImage = () =>{
    return "../../assets/img/logoCRM.png"
};

/**
 * Función para obtener una lista de países
 * @returns lista de países
 */
export const Countries = () =>{
    return [
        'Australia',
        'Argentina',
        'Bahamas',
        'Belice',
        'Bolivia',
        'Brasil',
        'Canadá',
        'Chile',
        'Colombia',
        'Costa Rica',
        'Cuba',
        'Ecuador',
        'España',
		'El Salvador',
		'Estados Unidos',
        'Guatemala',
        'Guyana',
        'Haití',
        'Honduras',
        'Jamaica',
        'México',
        'Nicaragua',
        'Panamá',
        'Paraguay',
        'Perú',
        'República Dominicana',
        'Surinam',
        'Uruguay',
        'Venezuela'
      ];
};

/**
 * Función para obtener una lista de bancos
 * @returns lista de bancos
 */
export const bancos = () =>{
    return [
        "Bancolombia",
        "Davivienda",
        "Banco de Bogota",
        "BBVA",
        "Banco de Occidente",
        "Colpatria",
        "Banco agrario",
        "Banco Itau",
        "Banco Popular",
        "Banco caja social",
        "Banco AV Villas",
        "Banco Santander",
        "Banco Pichincha",
    ]
};

/**
 * Función para optimizar una imagen
 * @param file archivo de imagen a optimizar
 * @returns archivo de imagen optimizado
 */
import imageCompression from 'browser-image-compression';

export const OptimizeImg = async (file: File): Promise<File> => {
    if (file && file.type.startsWith('image/')) {
        const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 700,
            useWebWorker: true,
            fileType: 'image/webp',
        };

        try {
            const compressedFile = await imageCompression(file, options);
             const newFile = new File(
                [compressedFile],
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                { type: 'image/webp' }
            );

            return newFile;
        } catch (error) {
            console.error('Error al comprimir la imagen:', error);
        }
    }
    return file;
};

export function renameFile(file: File, type: string, data: any): File {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const prefix = type === 'rut' ? 'rut' : 'cc';

    const tributaryNumber = data.tributary_number || 'sin-numero';
    const corporateName = data.corporate_name|| 'sin-nombre';

    const sanitizedCorporateName = corporateName.replace(/[^a-zA-Z0-9\-]/g, '_');

    const newFileName = `${prefix}-${year}-${month}-${tributaryNumber}-${sanitizedCorporateName}.pdf`;

    return new File([file], newFileName, { type: file.type });
  }
