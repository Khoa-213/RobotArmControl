import React,  {useMemo, useState} from "react";
//import component từ Antd
import { Input, Avatar, Dropdown, Space, List, Typography, Modal} from "antd";
//import icon 
import {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SearchOutlined,
} from "@ant-design/icons";
//import logo
import logo from "../../assets/logo.jpg";


//lấy component Text từ Typography
const{Text}= Typography;

export default function HeaderAdmin({

    //props truyền từ AdminLayout xuống 
    factories = [], // dsach factories được hardcode ở đây
    onSelectFactory, // hàm callback khi chọn factory 
    user = {name: "Admin", avatarUrl:""},// in4 user
    onProfile, //xử lý khi click vào thông tin 
    onSetting, //xử lý khi  click vào cài đặt 
    onLogout, //xử lý khi click vào đăng xuất
}){

    const [q, setQ] = useState("");
    //q :keyword search, setQ: update keyword
    
    const [openResult, setOpenResult] = useState(false);
    //openResult : trạng thái đóng mở của modal kết quả search
    //setOpentResult : hàm update trạng thái đóng/mở của modal 

    const results = useMemo(()=> {
        //results : là dsach các fatory sau khi lọc
        const keyword = q.trim().toLowerCase();
         if(!keyword) return[]; //nếu ko có kw thì ko lọc 

         //lọc factory theo name 
         return factories.filter((factory)=>
         (factory.name || "").toLowerCase().includes(keyword)
        );
        
    }, [q, factories])// hàm useMemo chỉ chạy lại khi q/factories thay đổi 

    //dropdown table cho mục avatar 
     const avatarDropdown = (
        <div style={{width: 200, background: "#fff", borderRadius: 8, padding:8,}}>
            <List
                size="small" 
                dataSource={[
                    {
                        key:"profile",
                        icon: <UserOutlined />,
                        label: "Thông tin",
                        onClick: onProfile,
                    },
                    {
                        key:"setting",
                        icon: <SettingOutlined />,
                        label:"Cài đặt",
                        onClick: onSetting,
                    },
                    {
                        key:"logout",
                        icon: <LogoutOutlined />,
                        label:"Đăng xuất",
                        onClick: onLogout,
                    },
                ]}
                renderItem={(item)=> (
                    <List.Item
                       style={{
                        cursor:"pointer",
                        borderRadius:6,
                        padding: "8px 10px",
                       }}
                       onClick={() => item.onClick?.()} //gọi hàm callBack
                       >
                        <Space>
                            {item.icon}
                            <Text type={item.danger ? "danger" : undefined} >
                                {item.label}
                            </Text>
                        </Space>

                    </List.Item>
                )}
            />

        </div>
     );

     return(
        <>
         {/* Header content */}
         <div
            style={{
                padding: "0 16px",
                background:"#ffffff",
                top: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
            }}
            >
                {/*Logo*/}
                <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <img src={logo} alt="Logo" style={{height: 40, width: 40}}/>
                    <Text strong style={{fontSize: 18, color: "#000000"}}>Robot Control</Text>
                </div>
                {/*Search factory*/}
                <div style={{ width: 420, maxWidth: "60vw", marginLeft: 60}}>
                    <Input.Search
                        className="header-search"
                        value={q}
                        allowClear
                        placeholder="Tìm kiếm nhà máy"
                        enterButton={<SearchOutlined />}
                        onChange={(e) => setQ(e.target.value)}
                        onSearch={() => {
                        if (q.trim()) setOpenResult(true);
                        }}
                     />
                     </div>
                    {/*Avater & Dropdown*/}
                    <Dropdown
                        popupRender={() => avatarDropdown}
                        trigger={["click"]} //click để mở 
                        placement="bottomRight" 
                    >
                        <div style={{cursor:"pointer", marginRight: 30}}>
                            <Space>
                                <Avatar
                                    src={user.avatarUrl || undefined}
                                    icon={!user.avatarUrl ? <UserOutlined /> : undefined}
                                />
                                <span style={{ fontWeight: 600, color:"#111"}}>
                                    {user.name || "Admin"}
                                </span>
                            </Space>

                        </div>
                    </Dropdown>
                     </div>

                    {/*Modal cho kết quả search*/}
                     <Modal 
                     title={`Kết quả tìm kiếm: "${q.trim()}"`}
                     open={openResult} //mở modal
                     onCancel={() => setOpenResult(false)}//đóng modal
                     footer={null}//vì ko cần footer
                     >
                        {results.length === 0 ? (
                            <Text type="secondary">
                                Không tìm thấy nhà máy nào.
                            </Text>
                        ) : (
                            <List
                               bordered
                               dataSource={results} //dsach kết quả
                               renderItem={(f) => (
                                <List.Item
                                   style={{cursor:"pointer"}}
                                   onClick={() => {
                                    onSelectFactory?.(f); 
                                    setOpenResult(false);
                                   }}>
                                   <Space direction="vertical" size={0}>
                                         <Text strong> {f.name} </Text>
                                         <Text type="secondary" style={{fontSize: 12}}>
                                            {f.location || "-" } - {f.status || "Hoạt động"}
                                         </Text>
                                    </Space> 

                                </List.Item>
                               )}
                               />

                        )}

                     </Modal>
                
        
        </>

     );
}

