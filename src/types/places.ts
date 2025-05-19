export interface Suggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlacesApiResponse {
  predictions: Suggestion[];
  status: string;
  error_message?: string;
}