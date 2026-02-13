{{/*
Expand the name of the chart.
*/}}
{{- define "store-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "store-chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "store-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "store-chart.labels" -}}
helm.sh/chart: {{ include "store-chart.chart" . }}
{{ include "store-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
store: {{ .Values.storeName }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "store-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "store-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
WordPress selector labels
*/}}
{{- define "store-chart.wordpress.selectorLabels" -}}
{{ include "store-chart.selectorLabels" . }}
app.kubernetes.io/component: wordpress
{{- end }}

{{/*
MySQL selector labels
*/}}
{{- define "store-chart.mysql.selectorLabels" -}}
{{ include "store-chart.selectorLabels" . }}
app.kubernetes.io/component: mysql
{{- end }}
