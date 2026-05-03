$files = Get-ChildItem -Path "C:\Users\DANILO MONTEZUMA\Desktop\Folders\7mo\Tesis\actividad2-compiladores\cal\backend\src" -Recurse -Filter "*.controlador.ts"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    if ($content -match '@Roles\(RolNombre\.Admin\)\s*@Controller') {
        # Remove from class level
        $content = $content -replace '@Roles\(RolNombre\.Admin\)\s*@Controller', '@Controller'
        
        # Add to Post, Patch, Delete, Put
        $content = $content -replace '(?m)^(\s*)@(Post|Patch|Delete|Put)', '$1@Roles(RolNombre.Admin)`n$1@$2'
        
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Updated $($file.Name)"
    }
}
