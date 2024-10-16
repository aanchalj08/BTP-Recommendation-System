import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Dashboard,
  HomeLayout,
  Landing,
  Login,
  Logout,
  Register,
  ForgotPassword,
  ResetPassword,
  DisplayItinerary,
  SavedItineraries,
  ItineraryDetail,
  AddPublication,
  Search,
  UserJournals,
  Refresh,
  EditProfile,
  StudentLogin,
  StudentRegister,
  SentRequests,
  IncomingRequests,
  Request,
} from "./pages";
import { ToastContainer, toast } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "forgotpassword",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password/:resetToken",
        element: <ResetPassword />,
      },
      {
        path: "display-itinerary",
        element: <DisplayItinerary />,
      },
      {
        path: "saved-itineraries",
        element: <SavedItineraries />,
      },
      {
        path: "publication/:id",
        element: <ItineraryDetail />,
      },
      {
        path: "add",
        element: <AddPublication />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "user/:userId",
        element: <UserJournals />,
      },
      {
        path: "refresh",
        element: <Refresh />,
      },
      {
        path: "edit-profile",
        element: <EditProfile />,
      },
      {
        path: "student/login",
        element: <StudentLogin />,
      },
      {
        path: "student/register",
        element: <StudentRegister />,
      },
      {
        path: "student/sent-requests",
        element: <SentRequests />,
      },
      {
        path: "faculty/incoming-requests",
        element: <IncomingRequests />,
      },
      {
        path: "send-request",
        element: <Request />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
