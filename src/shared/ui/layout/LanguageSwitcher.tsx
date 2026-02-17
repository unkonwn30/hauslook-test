import { useTranslation } from "react-i18next";
import { setLang } from "../../i18n/i18n";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {i18n.language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("es")}>ES</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("gl")}>GL</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("ca")}>CA</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
