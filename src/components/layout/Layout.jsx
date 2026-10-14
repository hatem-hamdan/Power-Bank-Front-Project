import { Outlet } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { AuthDialog } from "./AuthDialog";
import { BagDrawer } from "./BagDrawer";
import { Header } from "./Header";

export function Layout() {
  const { catalogNote } = useStore();

  return (
    <>
      <Header />
      {catalogNote ? <p className="store-note">{catalogNote}</p> : null}
      <main className="wrap">
        <Outlet />
      </main>
      <BagDrawer />
      <AuthDialog />
    </>
  );
}
