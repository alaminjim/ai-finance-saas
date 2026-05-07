import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";
import EditTransactionDrawer from "@/components/transaction/edit-transaction-drawer";
import Footer from "@/components/footer";

const AppLayout = () => {
  return (
    <>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-full">
        <Outlet />
      </main>
      <div className="mt-8">
        <Footer />
      </div>
    </div>
    <EditTransactionDrawer />
    </>
  );
};

export default AppLayout;
