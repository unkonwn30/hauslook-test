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
      <DropdownMenuContent
        align="end"
        className="bg-black text-white cursor-pointer flex flex-col "
      >
        <DropdownMenuItem
          onClick={() => setLang("es")}
          className="hover:bg-black/75"
        >
          ES
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLang("gl")}
          className="hover:bg-black/75"
        >
          GL
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLang("ca")}
          className="hover:bg-black/75"
        >
          CA
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
