import { EmployeeTable } from "@/components/custom/employees-table";
import { TitleHeader } from "@/components/custom/main-heading";
import Dashboard from "@/app/provider/ui";

export default function Page() {

    return (
        
          <Dashboard>
        <div className="flex gap-4 flex-col p-4 lg:p-6">
            <TitleHeader label="Manage Employees" span="Control employees with detailed information." />
            <EmployeeTable />
        </div>
          </Dashboard>
    )
}