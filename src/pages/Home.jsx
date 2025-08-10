import EventCard from "../components/EventCard"
import EventList from "../components/EventList";

const Home = () => {

  const events = [
    {
      id: 1,
      company: "TechCorp",
      title: "DevOps Deep Dive",
      date: "2025-07-15T09:30:00",
      description: "CI/CD, IaC & monitoring workshop.",
      price: 149.99,
      capacity: 50,
      image: "https://picsum.photos/id/1015/600/400",
      venue: {
        id: 1,
        name: "Downtown Conference Center",
        address: "123 Main St, Springfield",
        capacity: 200,
      },
      organizer: { id: 1, name: "John Doe" },
      tags: ["Tech", "DevOps", "CI/CD"],
      registered: [
        { id: 1, name: "User 1", avatar: "https://picsum.photos/40/40" },
        { id: 2, name: "User 2", avatar: "https://picsum.photos/40/40" },
        { id: 3, name: "User 3", avatar: "https://picsum.photos/40/40" },
        { id: 4, name: "User 4", avatar: "https://picsum.photos/40/40" },
        { id: 5, name: "User 5", avatar: "https://picsum.photos/40/40" },
        { id: 6, name: "User 6", avatar: "https://picsum.photos/40/40" },
      ],
    },
    // ...more events
  ];


  return (
    <div className="phone-frame">
      <div className="w-full flex flex-col gap-4 justify-center items-center ">
        <EventCard event={events[0]} registered={events[0].registered} />
        <EventList
          events={events}
          accordion={true} // set false to allow multiple open
          onRegister={(ev) => {
            // navigate(`/events/${ev.id}/register`)
            console.log("register", ev.id);
          }}
        />
      </div>
    </div>
  )
}

export default Home