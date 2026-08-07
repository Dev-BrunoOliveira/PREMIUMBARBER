import { prisma } from "@/lib/prisma";
import BarberDashboardView from "./BarberDashboardView";

export default async function BarberDashboard({ barber }: { barber: any }) {
  const appointments = await prisma.appointment.findMany({
    where: { barberId: barber.id },
    include: { client: true, service: true },
    orderBy: { date: "asc" },
  });

  const services = await prisma.service.findMany({
    where: { barberId: barber.id },
    orderBy: { price: "asc" },
  });

  return (
    <BarberDashboardView
      barber={barber}
      initialAppointments={JSON.parse(JSON.stringify(appointments))}
      initialServices={JSON.parse(JSON.stringify(services))}
    />
  );
}
