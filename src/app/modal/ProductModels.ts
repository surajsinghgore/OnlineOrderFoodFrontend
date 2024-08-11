export interface ProductsModels {
  id: string;
  category: string;
  enCategory:string,
  Name: string;
  enName:string,
  euName:string,
  heName:string,
  ImageUrl: string;
  Description?: string; // Optional
  // meal:string;
    meal: Record<string, string>;
  // Add other properties if needed
}
