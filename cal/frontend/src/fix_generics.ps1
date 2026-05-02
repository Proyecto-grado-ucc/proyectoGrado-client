$enc = [System.Text.UTF8Encoding]::new($false)
$base = 'C:\Users\DANILO MONTEZUMA\Desktop\Folders\7mo\Tesis\actividad2-compiladores\cal\frontend\src'
$files = @(
  'modulos\admin\paginas\Horarios.tsx',
  'modulos\admin\paginas\Evaluacion.tsx',
  'modulos\docente\paginas\DashboardDocente.tsx',
  'modulos\docente\paginas\HorarioDocente.tsx',
  'modulos\docente\paginas\EvaluacionDocente.tsx',
  'modulos\estudiante\paginas\DashboardEstudiante.tsx',
  'modulos\estudiante\paginas\FormulariosEstudiante.tsx',
  'modulos\estudiante\paginas\HorarioEstudiante.tsx'
)
foreach ($file in $files) {
  $path = Join-Path $base $file
  $content = [System.IO.File]::ReadAllText($path, $enc)
  $fixed = $content -replace 'const fetchAll = async <T>\(', 'const fetchAll = async <T extends object>('
  [System.IO.File]::WriteAllText($path, $fixed, $enc)
  Write-Host "Fixed: $file"
}
Write-Host "Done."
