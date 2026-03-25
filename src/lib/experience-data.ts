export interface Experience {
  id: string
  title: string
  company: string
  location: {
    city: string
    country: string
    lat: number
    lng: number
    isRemote: boolean
  }
  startDate: string
  endDate: string
  color: "pink" | "yellow" | "green" | "blue"
}

export const experiences: Experience[] = [
  {
    id: "1",
    title: "Сохранение лесов Амазонии",
    company: "Бразильская инициатива",
    location: {
      city: "Манаус",
      country: "Бразилия",
      lat: -3.119,
      lng: -60.0217,
      isRemote: false,
    },
    startDate: "2020-01-15",
    endDate: "2024-12-27",
    color: "green",
  },
  {
    id: "2",
    title: "Защита бассейна Конго",
    company: "Программа Центральной Африки",
    location: {
      city: "Киншаса",
      country: "ДР Конго",
      lat: -4.4419,
      lng: 15.2663,
      isRemote: false,
    },
    startDate: "2020-06-20",
    endDate: "2024-12-27",
    color: "green",
  },
  {
    id: "3",
    title: "Мониторинг лесов Борнео",
    company: "Проект Юго-Восточной Азии",
    location: {
      city: "Кучинг",
      country: "Малайзия",
      lat: 1.5535,
      lng: 110.3593,
      isRemote: false,
    },
    startDate: "2021-03-10",
    endDate: "2024-12-27",
    color: "blue",
  },
  {
    id: "4",
    title: "Охрана сибирской тайги",
    company: "Инициатива северных лесов",
    location: {
      city: "Якутск",
      country: "Россия",
      lat: 62.0355,
      lng: 129.6755,
      isRemote: false,
    },
    startDate: "2021-09-05",
    endDate: "2024-12-27",
    color: "pink",
  },
  {
    id: "5",
    title: "Сохранение тихоокеанского северо-запада",
    company: "Североамериканская программа",
    location: {
      city: "Ванкувер",
      country: "Канада",
      lat: 49.2827,
      lng: -123.1207,
      isRemote: false,
    },
    startDate: "2022-02-18",
    endDate: "2024-12-27",
    color: "yellow",
  },
]
