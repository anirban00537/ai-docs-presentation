import { Icon } from "@tabler/icons-react";
import { Row } from "./core";

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: string | Icon;
  getRows: () => Row[];
}
