import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function SearchBar({ placeholder, value, onChange }) {
  return (
    <Input.Search
      className="search-bar"
      value={value}
      allowClear
      placeholder={placeholder}
      enterButton={<SearchOutlined />}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
