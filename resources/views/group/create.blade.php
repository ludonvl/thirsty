@extends('layouts.app', [
    'class' => '',
    'elementActive' => 'drinks'
])

@section('content')
<div class="content">
        @if (session('status'))
            <div class="alert alert-success" role="alert">
                {{ session('status') }}
            </div>
        @endif
            <div class="row">
                <form class="col-md-12" action="{{ route('group.store') }}" method="POST">
                    @csrf
                    <div class="card">
                        <div class="card-header">
                            <h5 class="title">{{ __('Nouveau groupe de boisson') }}</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <label class="col-md-3 col-form-label">{{ __('Nom du groupe') }}</label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" name="name" class="form-control" required>
                                    </div>
                                    @if ($errors->has('name'))
                                        <span class="invalid-feedback" style="display: block;" role="alert">
                                            <strong>{{ $errors->first('name') }}</strong>
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col-md-12 text-center">
                                    <button type="submit" class="btn btn-info btn-round">{{ __('Ajouter') }}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
</div>
@endsection
