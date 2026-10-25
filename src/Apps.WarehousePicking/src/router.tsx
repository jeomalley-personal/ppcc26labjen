import { createBrowserRouter } from "react-router-dom"
import Layout from "@/pages/_layout"
import HomePage from "@/pages/home"
import NotFoundPage from "@/pages/not-found"
import { registerEntities, setHostNavigate } from "@/providers/pcf-host"

// IMPORTANT: Do not remove or modify the code below!
// Normalize basename when hosted in Power Apps
const BASENAME = new URL(".", location.href).pathname
if (location.pathname.endsWith("/index.html")) {
  history.replaceState(null, "", BASENAME + location.search + location.hash);
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout showHeader={false} />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
], { 
  basename: BASENAME // IMPORTANT: Set basename for proper routing when hosted in Power Apps
})

// Lets TALXIS base controls open records (context.navigation.openForm) as in-app navigation
registerEntities(
  {
    logicalName: "lab_warehouseitem",
    displayName: "Warehouse Item",
    primaryIdAttribute: "lab_warehouseitemid",
    primaryNameAttribute: "lab_name",
  },
  {
    logicalName: "lab_warehousetransaction",
    displayName: "Warehouse Transaction",
    primaryIdAttribute: "lab_warehousetransactionid",
    primaryNameAttribute: "lab_name",
  },
  {
    logicalName: "lab_warehouselocation",
    displayName: "Warehouse Location",
    primaryIdAttribute: "lab_warehouselocationid",
    primaryNameAttribute: "lab_name",
  },
)

setHostNavigate((path) => router.navigate(path))
