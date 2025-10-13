import React from "react";
import ContentHome from "../components/home/ContentHome";
import BestMenu from "../components/home/BestMenu";
import NewMenu from "../components/home/NewMenu";

export default function Home() {

  return (
    <div>
      <ContentHome />

      <p className="text-2xl text-center mt-4  font-semibold">
        เมนูขายดี
        </p>
      <BestMenu />
      <p className="text-2xl text-center mt-4  font-semibold">
        เมนูมาใหม่
        </p>
      <NewMenu />

    </div>
  );
}