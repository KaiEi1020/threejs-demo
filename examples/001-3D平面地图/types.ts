//城市
export interface City {
  name: string;
  longitude: number;
  latitude: number;
}

//飞线类型
export interface FlyData {
  from: string;
  to: string[];
  color: string;
}
