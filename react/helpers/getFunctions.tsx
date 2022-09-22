import axios from 'axios'

export const getPEZipCodes = async () => {
    if(!localStorage.getItem("PE-ZipCodes")){
        const zip_codes = await axios.get("/files/PE-ZipCodes.json");
        if(zip_codes && zip_codes.data){
            localStorage.setItem("PE-ZipCodes", JSON.stringify(zip_codes.data))
            return zip_codes.data
        }
    }
    return JSON.parse(localStorage.getItem("PE-ZipCodes") || '{}')
}
export const handleize = (str:string = '') => {
    str = str.replace('á','a').replace('à','a').replace('ä','a').replace('â','a').replace('Á','A').replace('À','A').replace('Â','A').replace('Ä','A').replace('ª','a').replace('å','a').replace('æ','ae');
    str = str.replace('é','e').replace('è','e').replace('ë','e').replace('ê','e').replace('É','E').replace('È','E').replace('Ê','E').replace('Ë','E');
    str = str.replace('í','i').replace('ì','i').replace('ï','i').replace('î','i').replace('Í','I').replace('Ì','I').replace('Ï','I').replace('Î','I');
    str = str.replace('ó','o').replace('ò','o').replace('ö','o').replace('ô','o').replace('Ó','O').replace('Ò','O').replace('Ö','O').replace('Ô','O').replace('ø','o');
    str = str.replace('ú','u').replace('ù','u').replace('ü','u').replace('û','u').replace('Ú','U').replace('Ù','U').replace('Û','U').replace('Ü','U');
    str = str.replace('ñ','n').replace('Ñ','n');
    str = str.toLowerCase();

    var toReplace = ['"', "'", "\\", "(", ")", "[", "]"];
    
    // For the old browsers
    for (var i = 0; i < toReplace.length; ++i) {
        str = str.replace(toReplace[i], "");
    }
    str = str.replace(/\W+/g, "-");
    if (str.charAt(str.length - 1) == "-")
        str = str.replace(/-+\z/, "");

    if (str.charAt(0) == "-")
        str = str.replace(/\A-+/, "");

    return str;
}
export const validAddressContext = (addrObj:any, valueFormat:boolean=false) => {
    if(addrObj && addrObj.state){
        if(handleize(valueFormat ? addrObj.state.value : addrObj.state) === 'provincia-de-lima'){
            valueFormat ? (addrObj.state.value = 'Lima') : (addrObj.state = 'Lima');
        }
    }
    if(addrObj && addrObj.city){
        if(handleize(valueFormat ? addrObj.city.value : addrObj.city) === 'provincia-de-lima'){
            valueFormat ? (addrObj.city.value = 'Lima') : (addrObj.city = 'Lima');
        }
    }
    if(localStorage.getItem("PE-ZipCodes")){
        const ubigeoList = JSON.parse(localStorage.getItem("PE-ZipCodes")??'{}')
        //state case
        if(addrObj && addrObj.state){
            let hasState = false;
            Object.entries(ubigeoList).forEach( (state:any) => {
                if(state && state.length>0){
                    if(handleize(state[0]) === handleize(valueFormat?addrObj.state.value:addrObj.state)) hasState = true;
                }
            })
            if(!hasState){
                valueFormat ? (addrObj.state.value = '') : (addrObj.state = '');
                valueFormat ? (addrObj.city.value = '') : (addrObj.city = '');
                valueFormat ? (addrObj.neighborhood.value = '') : (addrObj.neighborhood = '');
            }
        }
        //city case
        if(addrObj && addrObj.city){
            let hasCity = false;
            Object.entries(ubigeoList).forEach( (state:any) => {
                if(state && state.length>0){
                    if(handleize(state[0]) === handleize(valueFormat?addrObj.state.value:addrObj.state)){
                        Object.entries(state[1]).forEach( (city:any) => {
                            if(city && city.length>0){
                                if(handleize(city[0]) === handleize(valueFormat?addrObj.city.value:addrObj.city)) hasCity = true;
                            }
                        })
                    }
                }
            })
            if(!hasCity){
                valueFormat ? (addrObj.city.value = '') : (addrObj.city = '');
                valueFormat ? (addrObj.neighborhood.value = '') : (addrObj.neighborhood = '');
            }
        }
        //neighborhood case
        if(addrObj && addrObj.neighborhood){
            let hasNeighborhood = false;
            Object.entries(ubigeoList).forEach( (state:any) => {
                if(state && state.length>0){
                    if(handleize(state[0]) === handleize(valueFormat?addrObj.state.value:addrObj.state)){
                        Object.entries(state[1]).forEach( (city:any) => {
                            if(city && city.length>0){
                                if(handleize(city[0]) === handleize(valueFormat?addrObj.city.value:addrObj.city)){
                                    Object.entries(city[1]).forEach( (neighborhood:any) => {
                                        if(neighborhood && neighborhood.length){
                                            if(handleize(neighborhood[0]) === handleize(valueFormat?addrObj.neighborhood.value:addrObj.neighborhood)){
                                                hasNeighborhood = true;
                                                valueFormat ? (addrObj.postalCode.value = neighborhood[1]) : (addrObj.postalCode = neighborhood[1]);
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
            if(!hasNeighborhood){
                valueFormat ? (addrObj.neighborhood.value = '') : (addrObj.neighborhood = '');
            }
        }
    }
    return addrObj;
}
export const JWTDecode = (token:string = '') => {
    var base64Url = token.split('.').length >= 2 ? token.split('.')[1] : token.split('.')[0];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return jsonPayload !== '' ? JSON.parse(jsonPayload) : {};
}
export const getCookie = (name:string = '') => {
    function escape(s:string = '') { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
    var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : '';
}