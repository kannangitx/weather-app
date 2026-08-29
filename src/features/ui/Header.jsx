import Units from "../units/Units";
import Logo from "./Logo";

export default function Header({ units, setUnits }) {
  return (
    <div className="w-full h-full flex justify-between p-4 items-center">
      <Logo />

      <Units units={units} setUnits={setUnits} />
    </div>
  );
}
