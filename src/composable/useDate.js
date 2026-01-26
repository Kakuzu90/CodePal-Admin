export default function useDate() {
  const currentDate = new Date();
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const month = monthNames[currentDate.getMonth()];
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();

  const getTimeStamp = currentDate.getTime();
  const getFormattedDate = (date) => {
    const dateInit = new Date(date);
    const month = monthNames[dateInit.getMonth()];
    const day = dateInit.getDate();
    const year = dateInit.getFullYear();

    return `${month} ${day}, ${year}`;
  }
  const getCurrentDate = `${month} ${day}, ${year}`;

  return {
    getCurrentDate,
    getTimeStamp,
    getFormattedDate,
  }
}