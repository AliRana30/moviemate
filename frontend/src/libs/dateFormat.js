export const DateFormat = (date) =>{
    return new Date(date).toLocaleString('en-US',{
        weekday : 'short',
        day : 'numeric',
        hour : 'numeric',
        minute : 'numeric',
        month : 'long'
    })
}