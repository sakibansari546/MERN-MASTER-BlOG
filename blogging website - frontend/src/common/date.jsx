let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'dec'];
let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getDay = (timestamp) => {
    let date = new Date();
    return `${date.getDate()} ${months[date.getDay()]}`
}
export const getFullDay = (timeStamp) => {
    let date = new Date(timeStamp);

    return `${date.getDate()} ${months[date.getDay()]} ${date.getFullYear()}`
}
// export default { getDay, getFullDay };