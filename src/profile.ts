export interface Profile {
  host: string;
  protocol: string;
  port: number;
  username: string;
  password: string;
  projects: string;
  issueTypes: string;

  sprintRapidView: number;
  sprintCustomFieldId: number;
  sprintState: string;
}
