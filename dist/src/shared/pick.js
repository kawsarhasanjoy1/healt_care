const pick = (obj, keys) => {
    let finalObj = {};
    for (let key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key];
        }
    }
    return finalObj;
};
export default pick;
